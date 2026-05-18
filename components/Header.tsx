import UserInfo from './UserInfo'

export default function Header() {
  return (
    <header className="h-14 bg-white border-b border-[#e2e8f0] flex items-center justify-end px-6 flex-shrink-0">
      <UserInfo />
    </header>
  )
}
