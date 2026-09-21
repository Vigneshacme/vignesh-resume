import { QdrantClient } from '@qdrant/js-client-rest';

export interface ResumeChunk {
  id: number | string;
  title: string;
  content: string;
  category: 'summary' | 'skills' | 'experience' | 'architecture';
  tags: string[];
}

export const COLLECTION_NAME = 'resume_knowledge';
export const VECTOR_DIMENSION = 768; // Compatible with standard text embedding models (e.g. Gemini text-embedding-004)

export class QdrantService {
  private client: QdrantClient;

  constructor() {
    const url = process.env.QDRANT_URL || 'http://127.0.0.1:6333';
    const apiKey = process.env.QDRANT_API_KEY;

    this.client = new QdrantClient({
      url,
      apiKey,
      checkCompatibility: false,
    });
  }

  /**
   * Ensure collection exists in Qdrant with Cosine distance metric.
   */
  async initCollection(): Promise<boolean> {
    try {
      const response = await this.client.getCollections();
      const exists = response.collections.some((col) => col.name === COLLECTION_NAME);

      if (!exists) {
        console.log(`[Qdrant] Creating collection "${COLLECTION_NAME}" (size: ${VECTOR_DIMENSION}, distance: Cosine)...`);
        await this.client.createCollection(COLLECTION_NAME, {
          vectors: {
            size: VECTOR_DIMENSION,
            distance: 'Cosine',
          },
        });
        console.log(`[Qdrant] Collection "${COLLECTION_NAME}" created successfully.`);
      }
      return true;
    } catch (error) {
      console.warn('[Qdrant] Could not initialize collection. Ensure Qdrant is running:', error);
      return false;
    }
  }

  /**
   * Upsert vectorized resume knowledge points into Qdrant.
   */
  async upsertPoints(points: Array<{ id: number; vector: number[]; payload: ResumeChunk }>) {
    await this.initCollection();
    return await this.client.upsert(COLLECTION_NAME, {
      wait: true,
      points: points.map((p) => ({
        id: p.id,
        vector: p.vector,
        payload: {
          title: p.payload.title,
          content: p.payload.content,
          category: p.payload.category,
          tags: p.payload.tags,
        },
      })),
    });
  }

  /**
   * Semantic vector search in Qdrant for top matching resume passages.
   */
  async searchRelevantChunks(queryVector: number[], limit = 3) {
    try {
      const results = await this.client.search(COLLECTION_NAME, {
        vector: queryVector,
        limit,
        with_payload: true,
      });

      return results.map((r) => ({
        score: r.score,
        payload: r.payload as unknown as ResumeChunk,
      }));
    } catch (error) {
      console.warn('[Qdrant] Search failed (Qdrant instance may be offline):', error);
      return [];
    }
  }
}

export const qdrantService = new QdrantService();
