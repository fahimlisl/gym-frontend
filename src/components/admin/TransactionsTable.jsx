export default function TransactionsTable({ transactions }) {
  let i = 1;
  return (
    <div className="border border-white/10 bg-black overflow-x-auto">

      <table className="min-w-full text-sm">
        <thead className="bg-neutral-900 text-gray-400">
          <tr>
            <Th>S.No</Th>
            <Th>DATE</Th>
            <Th>SOURCE</Th>
            <Th>AMOUNT</Th>
            <Th>METHOD</Th>
            <Th>STATUS</Th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((t) => (
            <tr
              key={t._id}
              className="border-t border-white/5 hover:bg-neutral-900"
            >
              <Td>{i++}</Td>
              <Td>{formatDate(t.paidAt)}</Td>
              <Td className="capitalize">{t.source}</Td>
              <Td className="font-bold">₹{t.amount}</Td>
              <Td className="uppercase">{t.paymentMethod}</Td>
              <Td>
                <span className="text-green-500 font-bold">
                  {t.status}
                </span>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-4 py-3 text-left tracking-widest text-xs">
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return (
    <td className={`px-4 py-3 ${className}`}>
      {children}
    </td>
  );
}

const formatDate = (d) =>
  new Date(d).toLocaleString();
