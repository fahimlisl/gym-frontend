export default function StatCard({ title, value }) {
  return (
    <div className="border border-white/10 bg-black p-6">
      <p className="text-sm text-gray-400 tracking-wide">
        {title}
      </p>
      <h3 className="text-3xl font-extrabold mt-2">
        {value}
      </h3>
    </div>
  );
}
