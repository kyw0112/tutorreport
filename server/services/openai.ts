import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

interface ReportGenerationData {
  studentName: string;
  grade: string;
  subject: string;
  classDate: string;
  lessonTopics: string;
  homeworkScore: number;
  studentNotes: string;
  nextAssignment: string;
}

export async function generateKoreanReport(data: ReportGenerationData): Promise<string> {
  try {
    const prompt = `다음 수업 정보를 바탕으로 학부모님께 보낼 전문적이고 정중한 한국어 보고서를 작성해주세요.

학생 정보:
- 이름: ${data.studentName}
- 학년: ${data.grade}
- 과목: ${data.subject}
- 수업일: ${data.classDate}

수업 내용:
- 학습 주제: ${data.lessonTopics}
- 숙제 점수: ${data.homeworkScore}점
- 수업 중 관찰사항: ${data.studentNotes}
- 다음 과제: ${data.nextAssignment}

보고서 작성 지침:
1. 정중하고 전문적인 어조 사용
2. 학생의 강점과 개선점을 균형있게 서술
3. 구체적인 학습 성과와 노력 과정 언급
4. 앞으로의 학습 방향 제시
5. 학부모님께 감사 인사 포함

보고서는 다음 구조로 작성해주세요:
- 인사말
- 수업 내용 요약
- 학생 평가 및 관찰사항
- 향후 학습 계획
- 마무리 인사

JSON 형식으로 응답해주세요: {"report": "보고서 내용"}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "당신은 한국의 전문 과외 선생님입니다. 학부모님께 보낼 정중하고 상세한 수업 보고서를 작성하는 전문가입니다. 항상 JSON 형식으로 응답해주세요."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.report || "보고서 생성에 실패했습니다.";
  } catch (error) {
    console.error("AI 보고서 생성 오류:", error);
    throw new Error("AI 보고서 생성에 실패했습니다: " + (error as Error).message);
  }
}

export async function analyzeStudentProgress(studentData: any): Promise<{
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}> {
  try {
    const prompt = `다음 학생 데이터를 분석하여 학습 진도와 성과를 평가해주세요.

학생 데이터: ${JSON.stringify(studentData)}

분석 결과를 다음 JSON 형식으로 제공해주세요:
{
  "strengths": ["강점1", "강점2", "강점3"],
  "improvements": ["개선점1", "개선점2", "개선점3"],
  "recommendations": ["추천사항1", "추천사항2", "추천사항3"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "당신은 교육 전문가입니다. 학생의 학습 데이터를 분석하여 정확하고 도움이 되는 피드백을 제공합니다."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      strengths: result.strengths || [],
      improvements: result.improvements || [],
      recommendations: result.recommendations || []
    };
  } catch (error) {
    console.error("학생 진도 분석 오류:", error);
    throw new Error("학생 진도 분석에 실패했습니다: " + (error as Error).message);
  }
}
