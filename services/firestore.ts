import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "./firebase";

export const db = getFirestore(app);

export async function testFirestore() {
  try {
    const ref = collection(db, "solicitudes");
    const snapshot = await getDocs(ref);

    console.log("Documentos:", snapshot.docs.map(doc => doc.data()));
  } catch (error) {
    console.error("Error Firestore:", error);
  }
}
