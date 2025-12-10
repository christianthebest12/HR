import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "./firestore";
import { Solicitud } from "../types";

const COLLECTION_NAME = "solicitudes";

// Crear una solicitud
export const crearSolicitud = async (data: Omit<Solicitud, "id">): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
  return docRef.id; // retornamos el ID generado por Firestore
};

// Obtener todas las solicitudes
export const obtenerSolicitudes = async (): Promise<Solicitud[]> => {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<Solicitud, "id">),
  }));
};

// Eliminar una solicitud
export const eliminarSolicitud = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};

// Actualizar una solicitud
export const actualizarSolicitud = async (id: string, data: Partial<Solicitud>): Promise<void> => {
  await updateDoc(doc(db, COLLECTION_NAME, id), data);
};
