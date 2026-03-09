import { evaluate } from "@lmnr-ai/lmnr";
import { toolSelectionScore } from "./evaluators";

import type { EvalData, EvalTarget } from "./types";
import dataset from './data/file-tools.json' with { type: "json" };
import {singleTurnExecutorWithMocks} from "./executors";

const executor = async (data: EvalData) => {
    return await singleTurnExecutorWithMocks(data);
}

evaluate({
    name: dataset as any,
    executor,
    evaluators: {
        selectionScore: (output, target) => {
            if (target?.category === 'secondary') return 1;

            return toolSelectionScore(output, target);
        }
    },
    groupName: 'file-tools-selection'
})