import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addQuestionMedia,
  createQuestion,
  createQuestionsBulk,
  deleteQuestion,
  removeQuestionMedia,
  reorderQuestions,
  setPartOptions,
  updateQuestion,
} from '../api/question';
import { examKeys } from './useExam';
import { partKeys } from './useExamPart';
import type { CreateMediaInput, PartOptionInput, QuestionInput, UpdateQuestionInput } from '../types/question';

const useInvalidate = () => {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: partKeys.all });
    qc.invalidateQueries({ queryKey: examKeys.all }); // savollar soni / bo'lim ballari o'zgaradi
  };
};

export const useCreateQuestion = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ partId, input }: { partId: string; input: QuestionInput }) => createQuestion(partId, input),
    onSuccess: invalidate,
  });
};

export const useCreateQuestionsBulk = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ partId, questions }: { partId: string; questions: QuestionInput[] }) => createQuestionsBulk(partId, questions),
    onSuccess: invalidate,
  });
};

export const useUpdateQuestion = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateQuestionInput }) => updateQuestion(id, input),
    onSuccess: invalidate,
  });
};

export const useDeleteQuestion = () => {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: string) => deleteQuestion(id), onSuccess: invalidate });
};

export const useReorderQuestions = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ partId, questionIds }: { partId: string; questionIds: string[] }) => reorderQuestions(partId, questionIds),
    onSuccess: invalidate,
  });
};

export const useAddQuestionMedia = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ questionId, input }: { questionId: string; input: CreateMediaInput }) => addQuestionMedia(questionId, input),
    onSuccess: invalidate,
  });
};

export const useRemoveQuestionMedia = () => {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (mediaId: string) => removeQuestionMedia(mediaId), onSuccess: invalidate });
};

export const useSetPartOptions = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ partId, options }: { partId: string; options: PartOptionInput[] }) => setPartOptions(partId, options),
    onSuccess: invalidate,
  });
};
