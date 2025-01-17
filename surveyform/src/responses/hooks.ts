import { ResponseDocument, SurveyEdition } from "@devographics/core-models"
import useSWR from "swr"
import { apiRoutes } from "~/lib/apiRoutes"

const basicFetcher = (url: string): any => fetch(url)
    .then((r) => r.json())
    .then((data) => {
        return { data };
    });

interface ApiData<T = any> {
    data: T
}

type ResponseWithSurvey = Required<ResponseDocument> & { survey: SurveyEdition }

/**
 * Passing no surveySlug will get all responses for the user 
 */
export const useUserResponse = (params: { surveySlug: SurveyEdition["surveyId"] }) => {
    const { surveySlug } = params || {}
    const { data, error } = useSWR<ApiData<ResponseWithSurvey>>(apiRoutes.response.single.href({ surveySlug }),
        basicFetcher)
    const loading = !error && !data
    return { response: data?.data, loading, error }
}

export const useUserResponses = () => {
    const { data, error } = useSWR<ApiData<Array<ResponseWithSurvey>>>(apiRoutes.response.multi.href, basicFetcher)
    const loading = !error && !data
    return { responses: data?.data, loading, error }
}