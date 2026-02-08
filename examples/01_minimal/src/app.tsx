import { useAtom } from 'jotai/react';
import { atom } from 'jotai/vanilla';

const countAtom = atom(0);

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  return (
    <div>
      count: {count} <button onClick={() => setCount((c) => c + 1)}>inc</button>
    </div>
  );
}

export default function App() {
  return (
    <div>
      <Counter />
      <p>countAtom: {String(countAtom)}</p>
    </div>
  );
}
