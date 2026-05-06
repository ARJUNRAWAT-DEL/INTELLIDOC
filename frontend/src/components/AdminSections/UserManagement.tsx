import { useEffect, useMemo, useState } from "react";
import { ApiService } from "../../services/api";

type UserItem = {
  id: number;
  email: string;
  name?: string | null;
  created_at?: string | null;
  auth_method?: string;
  password_set?: boolean;
  is_admin?: boolean;
};

export default function UserManagement() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiService.adminGet("/admin/users");
      setUsers(response.users || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) =>
      [user.email, user.name, user.auth_method]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [search, users]);

  const deleteUser = async (user: UserItem) => {
    if (!confirm(`Delete ${user.email}? This cannot be undone.`)) return;
    try {
      await ApiService.adminPost("/admin/users/delete", { user_id: user.id });
      await loadUsers();
    } catch (err: any) {
      alert(err?.message || "Failed to delete user");
    }
  };

  if (loading) return <div className="text-white/70">Loading users...</div>;
  if (error) return <div className="text-red-300">{error}</div>;

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold">User Management</h2>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full md:w-80 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-white/60">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Auth Method</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-t border-white/10">
                <td className="px-4 py-3">
                  {user.email}
                  {user.is_admin ? (
                    <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-300">
                      ADMIN
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3">{user.name || "—"}</td>
                <td className="px-4 py-3">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  {user.auth_method ||
                    (user.password_set ? "Password" : "OAuth")}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    disabled={user.is_admin}
                    onClick={() => deleteUser(user)}
                    className="rounded-xl border border-red-400/30 px-3 py-2 text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-white/60">
        Showing {filteredUsers.length} of {users.length} users
      </div>
    </div>
  );
}
