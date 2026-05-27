export const ChatIcon = ({ size = 26 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.66667 8.33301H6.675M10 8.33301H10.0083M13.3333 8.33301H13.3417M7.5 13.333H4.16667C3.24619 13.333 2.5 12.5868 2.5 11.6663V4.99967C2.5 4.0792 3.24619 3.33301 4.16667 3.33301H15.8333C16.7538 3.33301 17.5 4.0792 17.5 4.99967V11.6663C17.5 12.5868 16.7538 13.333 15.8333 13.333H11.6667L7.5 17.4997V13.333Z"
      stroke="url(#chatIconGradient)"
      strokeWidth="1.66667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient
        id="chatIconGradient"
        x1="5.76705"
        y1="-20.6253"
        x2="22.3898"
        y2="-18.3586"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#A268FF" />
        <stop offset="1" stopColor="#FF6EA9" />
      </linearGradient>
    </defs>
  </svg>
)
