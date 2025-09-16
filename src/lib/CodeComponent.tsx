import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CodeComponent = (props: any) => {
  const {children, className, ...rest} = props;
  const match = /language-(\w+)/.exec(className || '');
  return match ? (
    <SyntaxHighlighter
      language={match[1]}
      style={vscDarkPlus}
      PreTag="div"
    >
      {String(children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  ) : (
    <code className={className} {...rest}>
      {children}
    </code>
  );
};

export default CodeComponent;
