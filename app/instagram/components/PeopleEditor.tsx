"use client";

import { useEffect, useState, useCallback } from "react";
import {
  createPerson,
  assignPerson,
  getPeopleByMedia,
} from "../lib/peopleStore";
import Link from "next/link";

export function PeopleEditor({ mediaId }: { mediaId: string }) {
  const [name, setName] = useState("");
  const [people, setPeople] = useState<unknown[]>([]);

  const loadPeople = useCallback(async () => {
    const res = await getPeopleByMedia(mediaId);
    setPeople(res.data?.map((p: unknown) => (p as any).gallery_people) || []);
  }, [mediaId]);

  useEffect(() => {
    loadPeople();
  }, [loadPeople]);

  const add = async () => {
    if (!name.trim()) return;
    const res = await createPerson(name);
    await assignPerson(mediaId, res.data.id);
    setName("");
    loadPeople();
  };

  return (
    <div className="mt-2">
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add actor / actress"
          className="bg-black/40 text-white text-xs p-1"
        />
        <button onClick={add} className="text-xs text-white">
          +
        </button>
      </div>

      {people.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {people.map((person: unknown) =>
            (person as any).name ? (
              <Link
                key={(person as any).id}
                href={`/instagram/people/${(person as any).id}`}
                className="text-xs text-blue-400 hover:underline"
              >
                {(person as any).name}
              </Link>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
