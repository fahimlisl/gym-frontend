export default function ProgramCard({
  title,
  level,
  description,
}) {
  return (
    <div className="border border-white/10 bg-black p-8 hover:border-red-600 transition">
      <span className="text-xs font-bold tracking-widest text-red-600">
        {level}
      </span>

      <h3 className="text-2xl font-extrabold mt-3">
        {title}
      </h3>

      <p className="text-gray-400 mt-4">
        {description}
      </p>

      <button className="mt-6 border border-white/20 px-6 py-3 font-extrabold tracking-widest hover:border-red-600">
        VIEW DETAILS
      </button>
    </div>
  );
}
