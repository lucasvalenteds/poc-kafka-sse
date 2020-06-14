import React, { useState } from 'react';

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
  const [messages, setMessages] = useState<Message[]>([]);

  React.useEffect(() => {
    const service = new MessageService('http://localhost:8082');

    service.listen<Message>('new-message', (message) => {
      setMessages((previous: Message[]) => [...previous, message]);
    });

    return () => service.disconnect('new-message');
  }, []);

  return (
    <>
      <div>
        <h1>Messages</h1>
        <ul>
          {messages.map((message) => (
            <MessageListItem message={message} />
          ))}
        </ul>
      </div>
    </>
  );
};
