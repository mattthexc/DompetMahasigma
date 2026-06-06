import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { input } = await req.json();

    const systemPrompt = `Kamu adalah AI parser pintar untuk aplikasi pencatatan keuangan. 
Tugasmu adalah menganalisis kalimat user dan mengubahnya menjadi format JSON terstruktur.
Kamu HANYA BOLEH mengembalikan output berupa JSON valid, tanpa teks awalan atau akhiran apapun.

Format JSON yang harus kamu kembalikan:
{
  "title": "Keterangan transaksi (string singkat)",
  "amount": angka (integer positif, ubah k/K/ribu menjadi ribuan, hilangkan rp/rupiah),
  "type": "expense" | "income" | "debt_lend" | "debt_borrow",
  "category": "Kategori yang relevan (string)"
}

Panduan Tipe (type):
- "expense": Pengeluaran biasa (makan, jajan, beli pulsa, bensin).
- "income": Pemasukan (gajian, dikasih uang, transferan masuk).
- "debt_lend": Piutang (KITA meminjamkan uang ke orang lain / uang KITA keluar). Keyword: "teman pinjam", "piutang", "kasih utang", "pinjam uang ke saya". PENTING: Jika formatnya "[Nama] pinjam uang..." atau "[Nama] ngutang...", itu berarti "debt_lend" karena uang kita yang keluar untuk dia.
- "debt_borrow": Utang (KITA meminjam uang dari orang lain / uang MASUK ke kita). Keyword: "kita ngutang", "saya pinjem", "dapat pinjaman". PENTING: Jika formatnya "saya pinjam uang ke [Nama]", maka itu "debt_borrow" karena kita yang dapat uang.

Panduan Nominal:
- "50k" = 50000
- "10 ribu" = 10000
- "gocap" = 50000
- "cepek" = 100000

Contoh Input 1: "Makan siang 25k"
Output 1: {"title": "Makan siang", "amount": 25000, "type": "expense", "category": "Makan & Minum"}

Contoh Input 2: "Budi pinjam uang 50k"
Output 2: {"title": "Budi", "amount": 50000, "type": "debt_lend", "category": "Catatan Utang"}

Contoh Input 3: "Dikasih mamah 200 ribu"
Output 3: {"title": "Dikasih mamah", "amount": 200000, "type": "income", "category": "Lainnya"}

Contoh Input 4: "Ngutang ke Asep 100k"
Output 4: {"title": "Asep", "amount": 100000, "type": "debt_borrow", "category": "Catatan Utang"}

Contoh Input 5: "Hafiz pinjam uang ke saya 10k"
Output 5: {"title": "Hafiz", "amount": 10000, "type": "debt_lend", "category": "Catatan Utang"}

Contoh Input 6: "Saya meminjam uang ke Budi 100k" ATAU "Pinjam uang ke Budi 100k"
Output 6: {"title": "Budi", "amount": 100000, "type": "debt_borrow", "category": "Catatan Utang"}
(Catatan Penting: "Pinjam ke [Nama]" atau "Meminjam ke [Nama]" artinya KITA yang meminjam/berutang DARI mereka, jadi uang MASUK ke kita = debt_borrow).

Analisis input berikut dan kembalikan JSON saja:
Input: "${input}"`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'system', content: systemPrompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
      max_tokens: 150,
      response_format: { type: "json_object" }
    });

    const reply = chatCompletion.choices[0]?.message?.content || '{}';
    let parsedData = JSON.parse(reply);

    // POST-PROCESSING: Paksa tipe transaksi berdasarkan kata kunci mutlak (mencegah halusinasi AI)
    const lowerInput = input.toLowerCase();
    
    // Aturan 1: Jika kalimat mengandung "ke saya", "minjemin", atau nama orang di awal diikuti "pinjam"
    if (
      lowerInput.includes("ke saya") || 
      lowerInput.includes("ke aku") || 
      lowerInput.includes("minjemin") ||
      (/^[a-z]+\s+(pinjam|minjem|ngutang)/i.test(lowerInput) && !/^(saya|aku|kita)/i.test(lowerInput))
    ) {
      // Kecuali jika ada kata "saya pinjam ke" atau semacamnya
      if (!lowerInput.includes("saya pinjam") && !lowerInput.includes("aku pinjam")) {
        parsedData.type = "debt_lend";
        if (!parsedData.category || parsedData.category === "Umum") parsedData.category = "Catatan Utang";
      }
    }

    // Aturan 2: Jika kalimat berbunyi "saya meminjam", "aku ngutang", atau "pinjam ke"
    if (
      /(saya|aku|kita)\s+(pinjam|minjem|meminjam|ngutang)/i.test(lowerInput) || 
      lowerInput.includes("dapat pinjaman") || 
      lowerInput.includes("pinjam uang ke") || 
      lowerInput.includes("meminjam uang ke") ||
      lowerInput.includes("ngutang ke")
    ) {
      if (!lowerInput.includes("ke saya") && !lowerInput.includes("ke aku")) {
        parsedData.type = "debt_borrow";
        if (!parsedData.category || parsedData.category === "Umum") parsedData.category = "Catatan Utang";
      }
    }

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("SMART INPUT GROQ ERROR:", error);
    return NextResponse.json(
      { error: 'Gagal menganalisis input dengan AI.' },
      { status: 500 }
    );
  }
}
