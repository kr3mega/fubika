import { FastifyReply, FastifyRequest } from "fastify";
import { getBeatmap, getBeatmapLB, getBeatmapset } from "./beatmap.service";
import { BeatmapScoresQuery, SearchBeatmaps } from "./beatmap.schema";

const parseInput = (params: SearchBeatmaps) => {
    return {
        ...params,
        id: Number(params.id)
    };
};

export const handleBeatmapReq = async (
    req: FastifyRequest<{ Params: SearchBeatmaps }>,
    res: FastifyReply
) => {
    const input = parseInput(req.params);
    const beatmap = await getBeatmap(input);
    
    return res.status(200).send(beatmap);
};

export const handleBeatmapScoresReq = async (
    req: FastifyRequest<{ Params: SearchBeatmaps }>,
    res: FastifyReply
) => {
    const input = parseInput(req.params);
    const scores = await getBeatmapLB(input.id);
    
    return res.status(200).send(scores);
};

export const handleBeatmapsetReq = async (
    req: FastifyRequest<{ Params: SearchBeatmaps }>,
    res: FastifyReply
) => {
    const input = parseInput(req.params);
    const beatmapset = await getBeatmapset(input);
    
    return res.status(200).send(beatmapset);
};