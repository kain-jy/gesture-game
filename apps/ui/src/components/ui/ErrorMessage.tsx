interface ErrorMessageProps {
  message: string;
  className?: string;
}

export default function ErrorMessage({
  message,
  className = "",
}: ErrorMessageProps) {
  return (
    <div
      className={`p-4 bg-red-100 border border-red-400 text-red-700 rounded ${className}`}
    >
      {message}
    </div>
  );
}
