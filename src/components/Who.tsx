/** Avatar + name + account id — the leading cell of every trader table. */
export const Who = ({ initials, name, id }: { initials: string; name: string; id: string }) => (
  <div className="who">
    <div className="who-av">{initials}</div>
    <div>
      <div className="who-name">{name}</div>
      <div className="who-id">{id}</div>
    </div>
  </div>
);
