import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

let client: ApolloClient<any> | undefined = undefined;
const graphUrl = process.env.GRAPH_URL;
const cmsUrl = process.env.CMS_URL;

if (typeof window !== "undefined" && window.location !== undefined) {
    const queryString = window?.location?.search;
    const urlParams = new URLSearchParams(queryString);
    const preview_token = urlParams.get('preview_token') ?? undefined;

    if (preview_token) {
        const httpLink = createHttpLink({
            uri: `https://${graphUrl}/content/v2`,
        });

        const authLink = setContext((_, { headers }) => {
            return {
                headers: {
                    ...headers,
                    authorization: `Bearer ${preview_token}`
                }
            };
        });

        client = new ApolloClient({
            link: authLink.concat(httpLink),
            cache: new InMemoryCache()
        });

        const communicationScript = document.createElement('script');
        communicationScript.src = `https://${cmsUrl}/Util/javascript/communicationInjector.js`;
        communicationScript.setAttribute('data-nscript', 'afterInteractive')
        document.body.appendChild(communicationScript);
    }
}

if (client === undefined) {
    const singleGraphKey = process.env.GRAPH_SINGLE_KEY;
    const httpLink = createHttpLink({
        uri: `https://${graphUrl}/content/v2?auth=${singleGraphKey}`,
    });

    const authLink = setContext((_, { headers }) => {
        return {
            headers: {
                ...headers
            }
        };
    });

    client = new ApolloClient({
        link: authLink.concat(httpLink),
        cache: new InMemoryCache()
    });
}

export default client;

