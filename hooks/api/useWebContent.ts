import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useAxiosAuth from '../axios/use-axios-auth';

const baseEndpoint = '/web-content/pages';
const sectionsEndpoint = '/web-content/sections';

export interface WebPage {
  id: number;
  slug: string;
  title: string;
  description?: string;
  is_published: boolean;
  seo_meta?: {
    title?: string;
    description?: string;
    keywords?: string;
    og_image?: string;
  };
  sections?: WebSection[];
  created_at: string;
  updated_at: string;
}

export interface WebSection {
  id: number;
  page_id: number;
  type: 'hero' | 'promo_grid' | 'steps' | 'features' | 'testimonials' | 'faq' | 'cta' | 'custom_html';
  name?: string;
  content: any;
  order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

// Pages Hooks
export const useGetWebPages = () => {
  const axiosAuth = useAxiosAuth();

  const getPages = async (): Promise<WebPage[]> => {
    const { data } = await axiosAuth.get(baseEndpoint);
    return data;
  };

  return useQuery({
    queryKey: ['web-pages'],
    queryFn: getPages,
  });
};

export const useGetPublishedPages = () => {
  const axiosAuth = useAxiosAuth();

  const getPages = async (): Promise<WebPage[]> => {
    const { data } = await axiosAuth.get(`${baseEndpoint}/published`);
    return data;
  };

  return useQuery({
    queryKey: ['web-pages-published'],
    queryFn: getPages,
  });
};

export const useGetPageBySlug = (slug: string) => {
  const axiosAuth = useAxiosAuth();

  const getPage = async (): Promise<WebPage> => {
    try {
      const { data } = await axiosAuth.get(`${baseEndpoint}/slug/${slug}`);
      return data;
    } catch (error: any) {
      // If 404, throw error so React Query can handle it
      if (error?.response?.status === 404) {
        throw new Error('Page not found');
      }
      throw error;
    }
  };

  return useQuery({
    queryKey: ['web-page', slug],
    queryFn: getPage,
    enabled: !!slug,
    retry: false, // Don't retry on 404
    refetchOnWindowFocus: false, // Don't refetch when window focus
  });
};

export const useCreateWebPage = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const createPage = async (payload: Partial<WebPage>) => {
    const { data } = await axiosAuth.post(baseEndpoint, payload);
    return data;
  };

  return useMutation({
    mutationFn: createPage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['web-pages'] });
    },
  });
};

export const useUpdateWebPage = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const updatePage = async ({
    id,
    data,
  }: {
    id: number;
    data: Partial<WebPage>;
  }) => {
    const response = await axiosAuth.patch(`${baseEndpoint}/${id}`, data);
    return response.data;
  };

  return useMutation({
    mutationFn: updatePage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['web-pages'] });
    },
  });
};

export const useTogglePagePublish = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const togglePublish = async (id: number) => {
    const response = await axiosAuth.patch(`${baseEndpoint}/${id}/toggle-publish`);
    return response.data;
  };

  return useMutation({
    mutationFn: togglePublish,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['web-pages'] });
    },
  });
};

export const useDeleteWebPage = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const deletePage = async (id: number) => {
    const response = await axiosAuth.delete(`${baseEndpoint}/${id}`);
    return response.data;
  };

  return useMutation({
    mutationFn: deletePage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['web-pages'] });
    },
  });
};

// Sections Hooks
export const useGetWebSections = () => {
  const axiosAuth = useAxiosAuth();

  const getSections = async (): Promise<WebSection[]> => {
    const { data } = await axiosAuth.get(sectionsEndpoint);
    return data;
  };

  return useQuery({
    queryKey: ['web-sections'],
    queryFn: getSections,
  });
};

export const useGetSectionsByPage = (pageId: number) => {
  const axiosAuth = useAxiosAuth();

  const getSections = async (): Promise<WebSection[]> => {
    const { data } = await axiosAuth.get(`${sectionsEndpoint}/page/${pageId}`);
    return data;
  };

  return useQuery({
    queryKey: ['web-sections', pageId],
    queryFn: getSections,
    enabled: !!pageId,
  });
};

export const useCreateWebSection = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const createSection = async (payload: Partial<WebSection>) => {
    const { data } = await axiosAuth.post(sectionsEndpoint, payload);
    return data;
  };

  return useMutation({
    mutationFn: createSection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['web-sections'] });
      queryClient.invalidateQueries({ queryKey: ['web-pages'] });
    },
  });
};

export const useUpdateWebSection = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const updateSection = async ({
    id,
    data,
  }: {
    id: number;
    data: Partial<WebSection>;
  }) => {
    const response = await axiosAuth.patch(`${sectionsEndpoint}/${id}`, data);
    return response.data;
  };

  return useMutation({
    mutationFn: updateSection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['web-sections'] });
      queryClient.invalidateQueries({ queryKey: ['web-pages'] });
    },
  });
};

export const useToggleSectionVisibility = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const toggleVisibility = async (id: number) => {
    const response = await axiosAuth.patch(`${sectionsEndpoint}/${id}/toggle-visibility`);
    return response.data;
  };

  return useMutation({
    mutationFn: toggleVisibility,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['web-sections'] });
      queryClient.invalidateQueries({ queryKey: ['web-pages'] });
    },
  });
};

export const useReorderSections = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const reorder = async ({
    pageId,
    section_ids,
  }: {
    pageId: number;
    section_ids: number[];
  }) => {
    const response = await axiosAuth.post(`${sectionsEndpoint}/page/${pageId}/reorder`, {
      section_ids,
    });
    return response.data;
  };

  return useMutation({
    mutationFn: reorder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['web-sections'] });
      queryClient.invalidateQueries({ queryKey: ['web-pages'] });
    },
  });
};

export const useDuplicateSection = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const duplicate = async (id: number) => {
    const response = await axiosAuth.post(`${sectionsEndpoint}/${id}/duplicate`);
    return response.data;
  };

  return useMutation({
    mutationFn: duplicate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['web-sections'] });
      queryClient.invalidateQueries({ queryKey: ['web-pages'] });
    },
  });
};

export const useDeleteWebSection = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const deleteSection = async (id: number) => {
    const response = await axiosAuth.delete(`${sectionsEndpoint}/${id}`);
    return response.data;
  };

  return useMutation({
    mutationFn: deleteSection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['web-sections'] });
      queryClient.invalidateQueries({ queryKey: ['web-pages'] });
    },
  });
};

// Aliases for consistent naming
export const useToggleVisibilitySection = useToggleSectionVisibility;
export const useReorderWebSections = useReorderSections;
export const useDuplicateWebSection = useDuplicateSection;

