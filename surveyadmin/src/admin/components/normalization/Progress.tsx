import React, { useEffect } from "react";
import { statuses } from "./Normalization";
import gql from "graphql-tag";
import { useMutation } from "~/lib/graphql";
import { Loading } from "~/core/components/ui/Loading";

const Progress = (props) => {
  const {
    responsesCount,
    doneCount,
    enabled,
    setEnabled,
    refetchMissingFields,
    segments,
  } = props;
  const segmentInProgress = segments.find(
    (s) => s.status === statuses.inProgress
  );

  const segmentsDone = segments.filter((s) => s.status === statuses.done);

  useEffect(() => {
    if (doneCount >= responsesCount) {
      refetchMissingFields();
    }
  }, [doneCount, responsesCount]);

  return (
    <div className="normalization-progress">
      {responsesCount > 0 && (
        <div>
          <h3>
            Found {responsesCount} responses to normalize…{" "}
            {enabled ? (
              <button
                onClick={() => {
                  setEnabled(false);
                }}
              >
                Stop
              </button>
            ) : (
              <button
                onClick={() => {
                  setEnabled(true);
                }}
              >
                Restart
              </button>
            )}
          </h3>
          {segmentsDone.map((s, i) => (
            <SegmentDone key={i} {...s} responsesCount={responsesCount} />
          ))}
          {segmentInProgress && (
            <SegmentInProgress
              {...props}
              segmentIndex={segmentsDone.length}
              startFrom={segmentInProgress?.startFrom}
            />
          )}
          {doneCount >= responsesCount && <div>Done</div>}
        </div>
      )}
    </div>
  );
};

const SegmentDone = ({ startFrom, responsesCount, data }) => {
  const { duration, discardedCount, errorCount } = data;
  return (
    <div>
      {startFrom}/{responsesCount} done in {duration}s ({errorCount} errors,{" "}
      {discardedCount} responses discarded)
    </div>
  );
};

const normalizeSurveyMutation = gql`
  mutation normalizeSurvey(
    $surveyId: String
    $fieldId: String
    $startFrom: Int
    $limit: Int
    $onlyUnnormalized: Boolean
  ) {
    normalizeSurvey(
      surveyId: $surveyId
      fieldId: $fieldId
      startFrom: $startFrom
      limit: $limit
      onlyUnnormalized: $onlyUnnormalized
    )
  }
`;

const SegmentInProgress = ({
  survey,
  fieldId,
  segmentIndex,
  startFrom,
  responsesCount,
  enabled,
  onlyUnnormalized,
  isAllFields,
  updateSegments,
  segmentSize,
}) => {
  const surveyId = survey.slug;

  const mutateFunction = useMutation(normalizeSurveyMutation);

  useEffect(() => {
    if (enabled) {
      /*

      When only normalizing unnormalized results, we'll first get a fresh list of all unnormalized
      IDs at every iteration, so we don't need to offset them using startFrom

      */
      mutateFunction({
        surveyId,
        fieldId: isAllFields ? null : fieldId,
        startFrom: onlyUnnormalized ? 0 : startFrom,
        limit: segmentSize,
        onlyUnnormalized,
      }).then((data) => {
        const doneCount = startFrom + data?.normalizeSurvey?.count;
        updateSegments({
          doneCount,
          doneSegmentIndex: segmentIndex,
          doneSegmentData: data?.normalizeSurvey,
          segmentSize,
        });
      });
    }
  }, [segmentIndex, enabled]);

  return (
    <div>
      Normalizing {startFrom}/{responsesCount} responses…{" "}
      {enabled ? <Loading /> : <span>Paused</span>}
    </div>
  );
};

export default Progress;
