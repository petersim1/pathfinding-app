const Benchmark = ({
  benchmark,
}: {
  benchmark: Record<string, { nIter: number; nScan: number; pLen: number }>;
}): JSX.Element => {
  return (
    <div className="absolute left-0 top-0">
      <p>Benchmarks:</p>
      {Object.entries(benchmark).map(([k, d]) => (
        <div key={k} className="my-2">
          <p className="text-sm">{k}</p>
          <ul className="text-xs list-disc *:ml-3">
            <li>
              Nodes Searched: <span className="font-bold">{d.nIter}</span>
            </li>
            <li>
              Nodes Scanned: <span className="font-bold">{d.nScan}</span>
            </li>
            <li>
              Path Length: <span className="font-bold">{d.pLen}</span>
            </li>
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Benchmark;
