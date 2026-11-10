import { FastifyInstance } from 'fastify';

export async function uploadRoutes(server: FastifyInstance) {
  server.post('/api/uploads', async (request, reply) => {
    try {
      await request.jwtVerify();
      const data = await request.file();

      if (!data) {
        return reply.status(400).send({ error: 'No file uploaded' });
      }

      // Convert buffer to base64 data URI for portable local demo storage without external S3 configuration requirement
      const buffer = await data.toBuffer();
      const base64 = buffer.toString('base64');
      const mimeType = data.mimetype || 'image/png';
      const dataUri = `data:${mimeType};base64,${base64}`;

      return {
        url: dataUri,
        width: 400,
        height: 300,
      };
    } catch (err) {
      return reply.status(401).send({ error: 'Upload failed or unauthorized' });
    }
  });
}
