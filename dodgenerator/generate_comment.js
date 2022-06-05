const REGEXP_LINE_HEADER = /## ?/;
const REGEXP_LINE_CODE = /``` ?/;
const REGEXP_LINE_CODE_ENV = /http:\/\/localhost:[\d]*/;
const REGEXP_LINE_MARKER = /^\- .*/;
const REGEXP_LINE_BOLD = /\*\*.*\*\*/;
const REGEXP_LINE_IMAGE = /^<img.*src="(.*)png">/;
const REGEXP_LINE_IMAGE_URL = /https?:\/\/.*.png/;

const MD_BOLD_SIGN = '**';
const MD_MARKER_SIGN = '-';

const JIRA_LINE_HEADER = 'h3. ';
const JIRA_LINE_CODE_START = '{code:bash}';
const JIRA_LINE_CODE_END = '{code}';
const JIRA_LINE_CODE_ENV = '{{ENV}}';
const JIRA_LINE_MARKER = '-';
const JIRA_LINE_BOLD = '*';

const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

const convertHeader = line => {
  return (line.match(REGEXP_LINE_HEADER))
    ? JIRA_LINE_HEADER + line.split(REGEXP_LINE_HEADER)[1]
    : line;
};

const convertCode = (isCode => line => {
  if (line.match(REGEXP_LINE_CODE)) {
    isCode = !isCode;
    return isCode ? JIRA_LINE_CODE_START : JIRA_LINE_CODE_END;
  }
  return line;
})(false);

const convertEnv = line => {
  if (line.match(REGEXP_LINE_CODE_ENV)) {
    const [start, end] = line.split(REGEXP_LINE_CODE_ENV);
    return `${start}${JIRA_LINE_CODE_ENV}${end}`;
  }
  return line;
};

const convertMarkers = line => {
  if (line.match(REGEXP_LINE_MARKER)) {
    const [start, content] = line.split(MD_MARKER_SIGN);
    return `${start}${JIRA_LINE_MARKER} ${content.trim()}`;
  }
  return line;
};

const convertBolds = line => {
  if (line.match(REGEXP_LINE_BOLD)) {
    const [start, content, end] = line.split(MD_BOLD_SIGN);
    return `${start}${JIRA_LINE_BOLD}${content.trim()}${JIRA_LINE_BOLD}${end}`;
  }
  return line;
};

const convertImages = line => {
  if (line.match(REGEXP_LINE_IMAGE)) {
    const url = line.match(REGEXP_LINE_IMAGE_URL)[0];
    return `!${url}|width=600!`;
  }
  return line;
};

const convert = arr => arr.map(line => pipe(
  convertHeader,
  convertCode,
  convertEnv,
  convertBolds,
  convertMarkers,
  convertImages
)(line));

const generate = (comment) => {
  try {
    const result = convert(comment.split(/\r?\n/)).join('\n');
    return result;
  } catch (error) {
    console.error(error);
  }
};
