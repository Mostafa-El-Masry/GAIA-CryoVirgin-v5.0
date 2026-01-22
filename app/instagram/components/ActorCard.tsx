import Link from "next/link";
import Image from "next/image";

interface Actor {
  id: string;
  avatar_url: string;
  name: string;
}

interface ActorCardProps {
  actor: Actor;
}

export function ActorCard({ actor }: ActorCardProps) {
  return (
    <Link
      href={`/instagram/people/${actor.id}`}
      className="flex flex-col items-center gap-2 min-w-[84px] group transition-transform hover:-translate-y-1"
    >
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 p-[2px] group-hover:from-indigo-500 group-hover:to-pink-500 transition-all">
          <Image
            src={actor.avatar_url}
            alt={`${actor.name}'s avatar`}
            width={64}
            height={64}
            className="w-full h-full rounded-full object-cover bg-black shadow-md"
          />
        </div>
      </div>

      <span className="text-white text-[11px] opacity-75 group-hover:opacity-100 truncate max-w-[72px] text-center">
        {actor.name}
      </span>
    </Link>
  );
}
