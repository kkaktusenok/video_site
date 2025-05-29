import { Client, Databases, Query, ID } from "appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;

const client = new Client()
    .setEndpoint(`https://cloud.appwrite.io/v1`)
    .setProject(PROJECT_ID);

const databases = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
    try {
        const result = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [Query.equal('searchTerm', searchTerm)]
        );

        if (result.documents.length > 0) {
            const doc = result.documents[0];
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                doc.$id,
                {
                    count: doc.count + 1,
                    movie_id: movie.id, // Update movie_id in case it changed
                    poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
                }
            );
        } else {
            await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                ID.unique(),
                {
                    searchTerm: searchTerm,
                    count: 1,
                    movie_id: movie.id,
                    poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
                }
            );
        }
    } catch (e) {
        console.error("Error updating search count:", e);
        throw e; // Re-throw the error if you want calling code to handle it
    }
};

// Export the databases instance if needed elsewhere
export const getTrandingMovies = async () => {
    try {
        const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID,[
            Query.limit(5),
            Query.orderDesc("count")
        ])
        return result.documents;
    }catch {
        console.error("Cant find popular movies for the query");
    }
}

export { databases };