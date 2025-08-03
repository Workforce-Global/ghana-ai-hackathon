export interface ScanResult {
  id?: string
  userId: string
  label: string
  confidence: number
  modelUsed: string
  timestamp: any
  imageUrl?: string
  recommendations?: string
}

export async function saveScanResult(scanData: Omit<ScanResult, "id">) {
  try {
    const { collection, addDoc } = await import("firebase/firestore")
    const { db } = await import("./firebase")

    if (!db) {
      throw new Error("Firestore not available")
    }

    const docRef = await addDoc(collection(db, "scans"), scanData)
    return docRef.id
  } catch (error) {
    console.error("Error saving scan result:", error)
    throw error
  }
}

export async function getUserScans(userId: string): Promise<ScanResult[]> {
  try {
    const { collection, query, where, orderBy, getDocs } = await import("firebase/firestore")
    const { db } = await import("./firebase")

    if (!db) {
      throw new Error("Firestore not available")
    }

    const q = query(collection(db, "scans"), where("userId", "==", userId), orderBy("timestamp", "desc"))

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as ScanResult,
    )
  } catch (error) {
    console.error("Error fetching user scans:", error)
    return []
  }
}

export async function deleteUserData(userId: string) {
  try {
    const { collection, query, where, getDocs, deleteDoc, doc } = await import("firebase/firestore")
    const { db } = await import("./firebase")

    if (!db) {
      throw new Error("Firestore not available")
    }

    const q = query(collection(db, "scans"), where("userId", "==", userId))

    const querySnapshot = await getDocs(q)
    const deletePromises = querySnapshot.docs.map((document) => deleteDoc(doc(db, "scans", document.id)))

    await Promise.all(deletePromises)
  } catch (error) {
    console.error("Error deleting user data:", error)
    throw error
  }
}
