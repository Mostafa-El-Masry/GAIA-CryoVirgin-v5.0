export type LessonStatus = "active" | "archived";

export type LessonDefinition = {
  id: string;
  code: string;
  title: string;
  status: LessonStatus;
};

export type ArcDefinition = {
  id: string;
  label: string;
  title: string;
  description?: string;
  lessons: LessonDefinition[];
};

export type PathDefinition = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  order: number;
};
