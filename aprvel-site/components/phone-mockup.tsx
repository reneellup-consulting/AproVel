import mockupImg from "@/assets/mockup.png"

function PhoneBackground() {
  return (
    <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-linear-to-br from-muted to-muted/50 rounded-lg shadow-2xl transform rotate-3 opacity-50" />
  )
}

function PhoneHardwareButtons() {
  return (
    <>
      <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg" />
      <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg" />
      <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg" />
      <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg" />
    </>
  )
}

function PhoneHeader() {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="h-8 w-8 rounded-full bg-muted" />
      <div className="h-4 w-24 rounded bg-muted" />
    </div>
  )
}

function PhoneMainCard() {
  return (
    <div className="h-32 rounded-xl bg-primary/10 mb-6 p-4">
      <div className="h-4 w-1/2 bg-primary/20 rounded mb-2" />
      <div className="h-8 w-3/4 bg-primary rounded" />
    </div>
  )
}

function PhoneContentBlocks() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="h-20 w-1/2 rounded-lg bg-muted" />
        <div className="h-20 w-1/2 rounded-lg bg-muted" />
      </div>
      <div className="h-12 w-full rounded-lg bg-muted" />
      <div className="h-12 w-full rounded-lg bg-muted" />
      <div className="h-12 w-full rounded-lg bg-muted" />
    </div>
  )
}

function PhoneBottomNav() {
  return (
    <div className="mt-auto flex justify-around border-t border-border pt-4">
      <div className="h-6 w-6 rounded bg-primary" />
      <div className="h-6 w-6 rounded bg-muted" />
      <div className="h-6 w-6 rounded bg-muted" />
      <div className="h-6 w-6 rounded bg-muted" />
    </div>
  )
}

function PhoneScreen() {
  return (
    <div className="rounded-4xl overflow-hidden w-full h-full bg-card relative">
      <div className="p-6 h-full flex flex-col">
        <PhoneHeader />
        <PhoneMainCard />
        <PhoneContentBlocks />
        <PhoneBottomNav />
      </div>
    </div>
  )
}

export function PhoneMockup() {
  return (
    <div className="relative w-full max-w-lg">
      <PhoneBackground />
      <div className="relative mx-auto border-gray-800 bg-gray-800 border-14 rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
        <PhoneHardwareButtons />
        <img src={mockupImg.src} alt="App mockup" className="rounded-4xl overflow-hidden w-full h-full object-cover" />
      </div>
    </div>
  )
}
