import { MessageItem } from "./_message/message-item";

const messages = [
  {
    id: 1,
    message: "First message",
    date: new Date(),
    avatar: "https://avatars.githubusercontent.com/u/182516578?v=4",
    userName: "Jenny",
  },
  {
    id: 2,
    message: "Second message",
    date: new Date(),
    avatar: "https://avatars.githubusercontent.com/u/182516578?v=4",
    userName: "John",
  },
];

export function ChannelMessageList() {
  return (
    <div className="relative h-full">
      <div className="h-full overflow-y-auto px-4">
        {messages.map((message) => (
          <MessageItem key={message.id} {...message} />
        ))}
      </div>
    </div>
  );
}
