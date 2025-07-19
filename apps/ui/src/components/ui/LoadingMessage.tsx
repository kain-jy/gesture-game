interface LoadingMessageProps {
  message: string;
  className?: string;
}

export default function LoadingMessage({ 
  message, 
  className = "" 
}: LoadingMessageProps) {
  return (
    <div className={`p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded ${className}`}>
      {message}
    </div>
  );
}