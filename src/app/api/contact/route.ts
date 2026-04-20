import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/contact - Submit contact form / lead
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name,
      email,
      phone,
      company,
      message,
      subject,
      machineInterest,
      machineId,
      serviceId,
      customMachines,
      selectedMachineIds,
    } = body

    if (!name || !message) {
      return NextResponse.json({ error: 'name and message are required' }, { status: 400 })
    }

    const lead = await db.lead.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        company: company || null,
        message,
        subject: subject || null,
        machineInterest: machineInterest || null,
        machineId: machineId || null,
        serviceId: serviceId || null,
        customMachines: customMachines || null,
        selectedMachineIds: selectedMachineIds || null,
      },
    })

    return NextResponse.json({
      message: 'Your message has been submitted successfully. We will contact you soon.',
      data: lead,
    }, { status: 201 })
  } catch (error) {
    console.error('Error submitting contact form:', error)
    return NextResponse.json({ error: 'Failed to submit your message' }, { status: 500 })
  }
}
