import { apiRequest } from "@/lib/queryClient";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
export async function askChatbot(question: string, history: Message[] = []): Promise<string> {
  try {
    // Call our server API which will use the OpenAI API
    const res = await apiRequest("POST", "/api/chatbot", {
      question,
      history
    });
    const data = await res.json();
    return data.response;
  } catch (error) {
    console.error("Error in chatbot request:", error);
    throw new Error("Failed to get response from chatbot");
  }
}
