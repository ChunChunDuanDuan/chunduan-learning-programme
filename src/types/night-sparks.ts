export type NightSparkMode = "socratic" | "spark_sentence" | "one_sentence";

export type NightSparkReaction = "agree" | "disagree" | "association" | null;

export type NightSparkEntry = {
  id: string;
  user_id: string;
  mode: NightSparkMode;
  prompt_text: string | null;
  user_response: string;
  reaction: NightSparkReaction;
  marked_for_development: boolean;
  created_at: string;
  updated_at: string;
};
