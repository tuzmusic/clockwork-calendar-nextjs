import DayJsTz from "@/lib/models/DayJsTz";
import EmailGig from "@/lib/models/EmailGig";

export function EmailHtml({ gig }: { gig: ReturnType<EmailGig["serialize"]> }) {
  // get the gig month and insert it into the <td> tag with the date
  const month = DayJsTz(gig.id).format("MMM");
  // replace the month in the first <td> tag of the originalHtml with the month
  const html = gig.originalHtml?.replace(
    /<strong>(\d{1,2})/,
    `<strong style="white-space: nowrap">${month} $1`
  );


  return (
    <div className="py-2 w-full">
      <table cellPadding="2" cellSpacing="2">
        <tbody
          className="align-top"
          dangerouslySetInnerHTML={{ __html: html ?? "(email html here)" }}
        />
      </table>
    </div>
  );
}
