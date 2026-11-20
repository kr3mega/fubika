import { FastifyInstance } from "fastify";
import { handleBeatmapReq, handleBeatmapScoresReq, handleBeatmapsetReq } from "./beatmap.controller";
import { beatmapScoresQuerySchema, searchBeatmapsSchema } from "./beatmap.schema";

const beatmapRoutes = async (server: FastifyInstance) => {
    server.get('/:id', {
        schema: { params: searchBeatmapsSchema }
    }, handleBeatmapReq);

    server.get('/:id/scores', {
        schema: { 
            params: searchBeatmapsSchema,
            querystring: beatmapScoresQuerySchema
        }
    }, handleBeatmapScoresReq);

    server.get('/c/:id', {
        schema: { params: searchBeatmapsSchema }
    }, handleBeatmapsetReq);
}

export default beatmapRoutes;