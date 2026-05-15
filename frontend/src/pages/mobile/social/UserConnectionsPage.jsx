import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { API_URL } from "../../../config/api";
import BackButton from "../../../components/shared/BackButton";
import UserListItem from "../../../components/shared/UserListItem";
import { IconUsers, IconLoader } from "../../../components/icons/Icons";

export default function UserConnectionsPage({ type }) {
  const { t } = useTranslation();
  const { username } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const title = type === "followers" ? t("connections.followers") : t("connections.following");

  useEffect(() => {
    fetchConnections();
  }, [username, type]);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/api/users/${username}/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching connections:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HEADER STICKY GLASSMORPHISM */}
      <div 
        className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/10 flex items-center justify-between px-4 pb-1"
        style={{ paddingTop: 'calc(0.5rem + var(--safe-area-top))', height: 'calc(3.5rem + var(--safe-area-top))' }}
      >
        {/* Izquierda: Back Button */}
        <div className="w-10">
          <BackButton />
        </div>

        {/* Centro: Título dinámico */}
        <h1 className="text-sm font-bold tracking-wide">{title}</h1>

        {/* Derecha: Spacer para equilibrar */}
        <div className="w-10" />
      </div>

      {/* CONTENIDO */}
      <div className="px-4 pt-4 pb-24">
        {loading ? (
          /* SPINNER */
          <div className="flex items-center justify-center h-60">
            <IconLoader className="animate-spin h-6 w-6 text-primary" />
          </div>
        ) : users.length === 0 ? (
          /* ESTADO VACÍO */
          <div className="flex flex-col items-center justify-center h-60 text-center gap-3 opacity-50">
            <div className="p-4 bg-secondary/50 rounded-full">
              <IconUsers className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {type === "followers"
                ? t("connections.no_followers_yet")
                : t("connections.no_following_yet")}
            </p>
          </div>
        ) : (
          /* LISTA DE USUARIOS */
          <div className="space-y-1">
            {users.map((u) => (
              <UserListItem key={u.idUsuario} user={u} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

