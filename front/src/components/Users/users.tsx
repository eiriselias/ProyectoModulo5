"use client";

import { useEffect, useState } from "react";
import IUsers from "@/interfaces/IUsers";
import { useAuth } from "@/context/Authontext";
import Spinner from "../ui/Spinner";
import IUser from "@/interfaces/IUser";
const APIURL: string | undefined = process.env.NEXT_PUBLIC_API_URL;

const Users = () => {

  const {userData} = useAuth()
  const [users, setUsers] = useState<IUsers[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRole, setSelectedRole] = useState<string>("");


  useEffect(() => {
    const fetchUsers = async () => {
      if (!userData?.userData.id) {
        setLoading(false); // Termina la carga si no hay ID
        return;
      }

      const actualUser = userData?.userData.id

      try {
        const response = await fetch(`${APIURL}/user?parentId=${actualUser}`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setUsers(data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userData]); // Solo se ejecuta cuando userSesion cambia

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner /> {/* Show spinner while loading */}
      </div>
    );
  }

  const filteredUsers = selectedRole
  ? users.filter((user) => user.roles.some((role) => role.name === selectedRole))
  : users; // Mostrar todos si no se selecciona ningún rol


  return (
    <div className="container mx-auto p-4">
      <div>
      <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="mb-4 p-2 border rounded-md"
        >
          <option value="">Todos los roles</option>
          <option value="admin">Admin</option>
          <option value="candidate">Candidato</option>
          <option value="moderator">Moderador</option>
          <option value="voter">Votante</option>
          {/* Agrega más opciones según los roles que tengas */}
        </select>
        </div>
      <h1 className="text-2xl font-bold mb-4 text-center">Usuarios</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
          <thead>
            <tr className="bg-primaryColor text-white text-left">
              <th className="py-3 px-6 text-sm font-medium">Nombre</th>
              <th className="py-3 px-6 text-sm font-medium">Email</th>
              <th className="py-3 px-6 text-sm font-medium">DNI</th>
              <th className="py-3 px-6 text-sm font-medium">Domicilio</th>
              <th className="py-3 px-6 text-sm font-medium">Ciudad</th>
              <th className="py-3 px-6 text-sm font-medium">País</th>
              <th className="py-3 px-6 text-sm font-medium">Accion</th>
            </tr>
          </thead>
          <tbody>
             {filteredUsers.length > 0 ? (
              filteredUsers.map((user, idx) => (
                <tr
                  key={user.id}
                  className={`${
                    idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } border-t border-gray-200`}
                >
                  <td className="py-3 px-6 text-sm text-gray-700">
                    {user.name}
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-700">
                    {user.email}
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-700">
                    {user.dni}
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-700">
                    {user.address || "N/A"}
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-700">
                    {user.city || "N/A"}
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-700">
                    {user.country || "N/A"}
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-700">
                    <a
                      href={`/createCandidate/${user.id}`}
                      className="text-blue-500 hover:text-blue-700 font-medium"
                    >
                      Postular Candidato
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-4 text-center text-gray-500">
                  No se encontraron usuarios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
