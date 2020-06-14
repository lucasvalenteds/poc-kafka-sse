import React from 'react';

export type Message = {
  id: string;
  title: string;
  content: string;
  timestamp: string;
};

export class MessageService {
  private sse: EventSource;
  private listener?: any;

  public constructor(url: string) {
    this.sse = new EventSource(url);
  }

  public listen<T>(event: string, fn: (data: T) => void): void {
    this.listener = this.sse.addEventListener(event, (payload: any) => {
      if (payload?.data !== undefined) {
        fn(JSON.parse(payload.data));
      }
    });
  }

  public disconnect(event: string): void {
    this.sse.removeEventListener(event, this.listener);
  }
}

export type MessageListItemProps = {
  message: Message;
};

export const MessageListItem: React.FC<MessageListItemProps> = (props) => {
  return (
    <>
      <li key={props.message.id}>
        <div>
          <h2>{props.message.title}</h2>
          <p>{props.message.content}</p>
          <p>{props.message.timestamp}</p>
        </div>
      </li>
    </>
  );
};

export const App: React.FC = () => {
  const [messages, setMessages] = React.useState<Message[]>([]);

  React.useEffect(() => {
    const service = new MessageService(process.env.REACT_APP_CONSUMER_URL!);

    service.listen<Message>('new-message', (message) => {
      console.debug('%s: New message received', new Date(), { message });
      setMessages((previous: Message[]) => [message, ...previous]);
    });

    return () => service.disconnect('new-message');
  }, []);

  return (
    <>
      <div>
        <h1>{messages.length} Messages</h1>
        <ul>
          {messages.map((message, index) => (
            <MessageListItem key={message.id + index} message={message} />
          ))}
        </ul>
      </div>
    </>
  );
};
