import jwtDecode from 'jwt-decode';
import { useCurrentStateAndParams } from '@uirouter/react';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';

import { getUser } from '../users/user.service';
import { User } from '../users/types';

import { useLocalStorage } from './useLocalStorage';

interface State {
  user?: User | null;
}

const state: State = {};

export const UserContext = createContext<State | null>(null);

export function useUser() {
  const context = useContext(UserContext);

  if (context === null) {
    throw new Error('should be nested under UserProvider');
  }

  return context;
}

export function useAuthorizations(
  authorizations: string | string[],
  adminOnlyCE = false
) {
  const authorizationsArray =
    typeof authorizations === 'string' ? [authorizations] : authorizations;

  const { user } = useUser();
  const { params } = useCurrentStateAndParams();

  if (!user) {
    return false;
  }

  if (process.env.PORTAINER_EDITION === 'CE') {
    return !adminOnlyCE || isAdmin(user);
  }

  const { endpointId } = params;
  if (!endpointId) {
    return false;
  }

  if (isAdmin(user)) {
    return true;
  }

  if (
    !user.EndpointAuthorizations ||
    !user.EndpointAuthorizations[endpointId]
  ) {
    return false;
  }

  const userEndpointAuthorizations = user.EndpointAuthorizations[endpointId];
  return authorizationsArray.some(
    (authorization) => userEndpointAuthorizations[authorization]
  );
}

interface AuthorizedProps {
  authorizations: string | string[];
  children: ReactNode;
}

export function Authorized({ authorizations, children }: AuthorizedProps) {
  const isAllowed = useAuthorizations(authorizations);

  return isAllowed ? <>{children}</> : null;
}

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [jwt] = useLocalStorage('JWT', '');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (state.user) {
      setUser(state.user);
    } else if (jwt !== '') {
      const tokenPayload = jwtDecode(jwt) as { id: number };

      loadUser(tokenPayload.id);
    }
  }, [jwt]);

  const providerState = useMemo(() => ({ user }), [user]);

  if (jwt === '') {
    return null;
  }

  if (providerState.user === null) {
    return null;
  }

  return (
    <UserContext.Provider value={providerState}>
      {children}
    </UserContext.Provider>
  );

  async function loadUser(id: number) {
    const user = await getUser(id);
    state.user = user;
    setUser(user);
  }
}

export function useIsAdmin() {
  const { user } = useUser();
  return isAdmin(user);
}

export function isAdmin(user?: User | null): boolean {
  return !!user && user.Role === 1;
}
