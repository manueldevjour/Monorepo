import React from "react";
// import Accordion from "react-bootstrap/Accordion";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";

const defaultItems = [
  // "create_account",
  // "anonymous_survey",
  "questions_required",
  "data_used",
  "survey_design",
  "results_released",
  "team",
  "learn_more",
];

const Faq = ({ survey }) => {
  const items = survey.faq || defaultItems;
  return (
    <div className="faq survey-page-block">
      <h3 className="faq-heading survey-page-block-heading">
        <FormattedMessage id="general.faq" />
      </h3>
      <div className="faq-contents">
        {items.map((item, index) => (
          <FaqItem item={item} index={index} key={item} />
        ))}
      </div>
    </div>
  );
};

const FaqItem = ({ item, index }) => {
  return (
    <dl className="faq-item">
      <dt className="faq-item-heading">
        <FormattedMessage id={`faq.${item}`} />
      </dt>
      <dd className="faq-item-body">
        <FormattedMessage id={`faq.${item}.description`} html={true} />
      </dd>
    </dl>
  );
};

export default Faq;
