import { RequestOptions } from 'node:http';

export declare type Subject = "BasicMath" | "prealgebra" | "algebra" | "trigonometry" | "precalculus" | "calculus" | "statistics" | "finitemath" | "linearalgebra" | "chemistry" | "physics";
export declare type MessageGenre = "mathway" | "message" | "autoresolve" | "greeting" | "rating" | "survey";

export declare type CustomData = { // TODO
    /** Name of the variable to act with */
    variable?: string;
}

export declare type Message = {
    /** Content of the message (with HTML tags) */
    content: string;
    /** Genre/Type of the message */
    genre: MessageGenre;
    /** Timestamp of the message */
    timestamp: number;

    callout?: "ViewSteps" | "OpenGraph";
}

export declare type Topic = {
    /** Unique ID of the topic */
    id: number;
    /** Number between 0 and 1. Probability that this topic was meant */
    score: number;
    /** Topic text */
    text: string;
    /** Custom topic data */
    customData: CustomData;
    getResult: () => Promise<MessagesResponse>;
}

export  type MathwayResponse = MessagesResponse | TopicsResponse;

export declare type MessagesResponse = {
    /** Response type */
    type: "messagesResponse";
    /** Messages related to the provided request */
    messages: Message[];
}

export declare type TopicsResponse = {
    /** Response type */
    type: "topicsResponse";
    /** Array of suggested topics */
    topics: Topic[];
}

/**
 * Submit an expression to MathWay
 * 
 * @param expression Expression to submit (in LaTeX)
 * @param subject Answers subject
 * @param options Options
 */
export declare function submit(expression: string, subject: Subject, options?: SubmitOptions): Promise<MathwayResponse>;

/**
 * Return an result for the expression related to the topic
 * 
 * @param expression Expression to submit (in LaTeX)
 * @param subject Answers subject
 * @param topicId ID of the topic
 * @param options Options
 */
export declare function getTopicResult(expression: string, subject: Subject, topicId: string | number, options?: SubmitOptions): Promise<MessagesResponse>;

export declare type SubmitOptions = {
    /** 2-letter code of answers language */
    language?: string;
    /** Custom topic data */
    customData?: CustomData;
}

/**
 * Sends greeting request to MathWay
 * 
 * @param subject Answers subject
 * @param options Options
 */
export declare function greet(subject: Subject, options?: SubmitOptions): Promise<MessagesResponse>;

/**
 * Get glossary term definition
 * 
 * @param termId Term ID
 */
export declare function getGlossaryTerm(termId: string | number): Promise<string>;
