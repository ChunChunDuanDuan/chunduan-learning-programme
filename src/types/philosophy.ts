export type PhilosophyQuestionStatus =
  | "Unresolved"
  | "Initial understanding"
  | "Organized";

export type PhilosophyOutputStatus =
  | "Drafting"
  | "Completed"
  | "Ready to publish";

export type PhilosophyConcept = {
  id: string;
  user_id: string;
  title: string;
  philosophers?: string | null;
  current_understanding?: string | null;
  source_texts?: string | null;
  key_quotes?: string | null;
  unresolved_questions?: string | null;
  related_concepts?: string | null;
  created_at: string;
  updated_at: string;
};

export type PhilosophyTextMap = {
  id: string;
  user_id: string;
  title: string;
  author?: string | null;
  section?: string | null;
  core_problem?: string | null;
  argument_steps?: string | null;
  relation_to_previous?: string | null;
  relation_to_next?: string | null;
  difficulties?: string | null;
  related_concepts?: string | null;
  created_at: string;
  updated_at: string;
};

export type PhilosophyQuestion = {
  id: string;
  user_id: string;
  question: string;
  source_context?: string | null;
  current_answer?: string | null;
  unresolved_part?: string | null;
  related_concepts?: string | null;
  related_texts?: string | null;
  status: PhilosophyQuestionStatus;
  created_at: string;
  updated_at: string;
};

export type PhilosophyOutput = {
  id: string;
  user_id: string;
  title: string;
  type?: string | null;
  source_materials?: string | null;
  content?: string | null;
  status: PhilosophyOutputStatus;
  created_at: string;
  updated_at: string;
};
