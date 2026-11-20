import z from "zod";

export const searchBeatmapsSchema = z.object({
    id: z.coerce.number({ error: "O ID deve ser um número" }).int("O ID deve ser inteiro")
});

export const beatmapScoresQuerySchema = z.object({
    type: z.enum(['all', 'local', 'global']).optional()
});

export type SearchBeatmaps = z.infer<typeof searchBeatmapsSchema>;
export type BeatmapScoresQuery = z.infer<typeof beatmapScoresQuerySchema>;