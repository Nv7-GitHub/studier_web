import type { RequestHandler } from './$types';
import PocketBase, { type RecordModel } from 'pocketbase';

async function addQuestion(pb: PocketBase, question: RecordModel, questions: RecordModel[]) {
    if (question.include != "") {
        let q = await pb.collection("questions").getOne(question.id, {
            expand: "include,include.questions",
        });
        for (let i = 0; i < q.expand?.include.questions.length; i++) {
            addQuestion(pb, q.expand?.include.expand.questions[i], questions);
        }
    } else {
        questions.push(question);
    }
}

export const GET: RequestHandler = async ({ params, locals }) => {
    let set = await locals.pb?.collection("sets").getOne(params.set, {
        expand: "questions",
    });

    // Load questions
    let questions: RecordModel[] = [];
    for (let i = 0; i < set?.questions.length; i++) {
        await addQuestion(locals.pb!, set?.expand?.questions[i], questions);
    }

    // Generate file
    let res = "";
    for (let q of questions) {
        res += q.question + "\n";
        if (q.kind == "single") {
            res += q.answer.value + "\n\n";
        } else if (q.kind == "multiple") {
            for (let a of q.answer.values) {
                res += a + "\n";
            }
            res += "\n";
        } else if (q.kind == "blanks") {
            for (let a of q.answer.blanks) {
                res += `${a.key}: ${a.value}\n`;
            }
            res += "\n";
        }
    }

    return new Response(String(res.trimEnd()));
};