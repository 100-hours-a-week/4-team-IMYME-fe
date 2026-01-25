interface NicknameProps {
  nickname: string
}

export function Nickname({ nickname }: NicknameProps) {
  return <p className="mt-2 font-semibold">{nickname ? nickname : 'user'}</p>
}
