import { CreateMovieData, CreateMovieVariables, UpsertUserData, UpsertUserVariables, AddReviewData, AddReviewVariables, DeleteReviewData, DeleteReviewVariables, ListMoviesData, ListUsersData, ListUserReviewsData, GetMovieByIdData, GetMovieByIdVariables, SearchMovieData, SearchMovieVariables } from '../';
import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise} from '@angular/fire/data-connect';
import { CreateQueryResult, CreateMutationResult} from '@tanstack/angular-query-experimental';
import { CreateDataConnectQueryResult, CreateDataConnectQueryOptions, CreateDataConnectMutationResult, DataConnectMutationOptionsUndefinedMutationFn } from '@tanstack-query-firebase/angular/data-connect';
import { FirebaseError } from 'firebase/app';
import { Injector } from '@angular/core';

type CreateMovieOptions = DataConnectMutationOptionsUndefinedMutationFn<CreateMovieData, FirebaseError, CreateMovieVariables>;
export function injectCreateMovie(options?: CreateMovieOptions, injector?: Injector): CreateDataConnectMutationResult<CreateMovieData, CreateMovieVariables, CreateMovieVariables>;

type UpsertUserOptions = DataConnectMutationOptionsUndefinedMutationFn<UpsertUserData, FirebaseError, UpsertUserVariables>;
export function injectUpsertUser(options?: UpsertUserOptions, injector?: Injector): CreateDataConnectMutationResult<UpsertUserData, UpsertUserVariables, UpsertUserVariables>;

type AddReviewOptions = DataConnectMutationOptionsUndefinedMutationFn<AddReviewData, FirebaseError, AddReviewVariables>;
export function injectAddReview(options?: AddReviewOptions, injector?: Injector): CreateDataConnectMutationResult<AddReviewData, AddReviewVariables, AddReviewVariables>;

type DeleteReviewOptions = DataConnectMutationOptionsUndefinedMutationFn<DeleteReviewData, FirebaseError, DeleteReviewVariables>;
export function injectDeleteReview(options?: DeleteReviewOptions, injector?: Injector): CreateDataConnectMutationResult<DeleteReviewData, DeleteReviewVariables, DeleteReviewVariables>;

export type ListMoviesOptions = () => Omit<CreateDataConnectQueryOptions<ListMoviesData, undefined>, 'queryFn'>;
export function injectListMovies(options?: ListMoviesOptions, injector?: Injector): CreateDataConnectQueryResult<ListMoviesData, undefined>;

export type ListUsersOptions = () => Omit<CreateDataConnectQueryOptions<ListUsersData, undefined>, 'queryFn'>;
export function injectListUsers(options?: ListUsersOptions, injector?: Injector): CreateDataConnectQueryResult<ListUsersData, undefined>;

export type ListUserReviewsOptions = () => Omit<CreateDataConnectQueryOptions<ListUserReviewsData, undefined>, 'queryFn'>;
export function injectListUserReviews(options?: ListUserReviewsOptions, injector?: Injector): CreateDataConnectQueryResult<ListUserReviewsData, undefined>;

type GetMovieByIdArgs = GetMovieByIdVariables | (() => GetMovieByIdVariables);
export type GetMovieByIdOptions = () => Omit<CreateDataConnectQueryOptions<GetMovieByIdData, GetMovieByIdVariables>, 'queryFn'>;
export function injectGetMovieById(args: GetMovieByIdArgs, options?: GetMovieByIdOptions, injector?: Injector): CreateDataConnectQueryResult<GetMovieByIdData, GetMovieByIdVariables>;

type SearchMovieArgs = SearchMovieVariables | (() => SearchMovieVariables);
export type SearchMovieOptions = () => Omit<CreateDataConnectQueryOptions<SearchMovieData, SearchMovieVariables>, 'queryFn'>;
export function injectSearchMovie(args?: SearchMovieArgs, options?: SearchMovieOptions, injector?: Injector): CreateDataConnectQueryResult<SearchMovieData, SearchMovieVariables>;
