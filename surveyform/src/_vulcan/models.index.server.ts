// Export all your SERVER-ONLY models here
// Please do not remove the User model, which is necessary for auth
import { Save } from "@devographics/core-models/server";
import { User } from "~/core/models/user.server";
import { Project } from "@devographics/core-models/server";
// Add default connectors and dataSources creators for models that may miss some
// @see https://www.apollographql.com/docs/apollo-server/data/data-sources
import { addDefaultMongoConnector } from "@vulcanjs/mongo-apollo/server";
import { fetchSurveyFromId, fetchSurveysList } from "@devographics/core-models/server";
import { getResponseModel, initResponseModelServer } from "~/responses/model.server"; import { VulcanGraphqlModelServer } from "@vulcanjs/graphql/server";

let models: Array<VulcanGraphqlModelServer> = []
export const getServerModels = async () => {
    if (models.length) return models
    const surveys = await Promise.all((await fetchSurveysList()).map(sd => fetchSurveyFromId(sd.surveyId)))
    // @ts-ignore
    initResponseModelServer(surveys)
    models = [User, Save, Project, getResponseModel()]
    addDefaultMongoConnector(await models);
    return models
};


