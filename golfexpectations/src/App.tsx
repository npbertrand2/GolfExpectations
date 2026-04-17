import { useMemo, useState } from "react";
import "./App.css";
import {
  BOGEY_REFERENCE_HANDICAP_INDEX,
  calculateExpectedScores,
  validateHandicapRanks,
} from "./scoring/calculateExpectedScores";
import {
  buildPlayingHistoryInsight,
  validatePlayingHistory,
  type PlayingHistoryInsight,
  type PlayingHistorySummary,
  GHIN_FULL_WEIGHT_ROUNDS,
} from "./scoring/playingHistory";
import type { ExpectedScoreResult } from "./scoring/types";
import { parseCoursePaste } from "./parse/coursePaste";
import {
  addSavedCourse,
  formatSavedCourseLabel,
  loadSavedCourses,
  removeSavedCourse,
  type SavedCourse,
} from "./storage/savedCourses";

type HoleRowState = { par: string; yards: string; hcp: string };

const emptyHoles = (): HoleRowState[] =>
  Array.from({ length: 18 }, () => ({ par: "", yards: "", hcp: "" }));

function parseFiniteNumber(raw: string): number | null {
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) {
    return null;
  }
  return n;
}

function buildHoleInputs(rows: HoleRowState[]) {
  return rows.map((row, idx) => {
    const hole = idx + 1;
    const par = parseFiniteNumber(row.par);
    const yards = parseFiniteNumber(row.yards);
    const hcp = parseFiniteNumber(row.hcp);
    return { hole, par, yards, hcp };
  });
}

export default function App() {
  const [handicapIndex, setHandicapIndex] = useState("");
  const [teeName, setTeeName] = useState("");
  const [coursePar, setCoursePar] = useState("");
  const [courseRating, setCourseRating] = useState("");
  const [bogeyRating, setBogeyRating] = useState("");
  const [slopeRating, setSlopeRating] = useState("");
  const [holeRows, setHoleRows] = useState<HoleRowState[]>(emptyHoles);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [results, setResults] = useState<ExpectedScoreResult | null>(null);
  const [historyInsight, setHistoryInsight] = useState<PlayingHistoryInsight | null>(null);
  const [ghinScoreCount, setGhinScoreCount] = useState("");
  const [ghinHigh, setGhinHigh] = useState("");
  const [ghinLow, setGhinLow] = useState("");
  const [ghinAvg, setGhinAvg] = useState("");
  const [coursePasteText, setCoursePasteText] = useState("");
  const [pasteFeedback, setPasteFeedback] = useState<string | null>(null);
  const [savedCourses, setSavedCourses] = useState<SavedCourse[]>(() =>
    typeof window !== "undefined" ? loadSavedCourses() : [],
  );
  const [selectedSavedId, setSelectedSavedId] = useState("");

  function refreshSavedCourses() {
    setSavedCourses(loadSavedCourses());
  }

  function applySavedCourse(c: SavedCourse) {
    setTeeName(c.teeName);
    setCoursePar(String(c.coursePar));
    setCourseRating(String(c.courseRating));
    setBogeyRating(String(c.bogeyRating));
    setSlopeRating(String(c.slopeRating));
    setHoleRows(
      c.holes.map((h) => ({
        par: String(h.par),
        yards: String(h.yards),
        hcp: String(h.handicapRank),
      })),
    );
    setResults(null);
    setValidationError(null);
  }

  function handleSavedSelect(id: string) {
    setSelectedSavedId(id);
    if (!id) return;
    const c = savedCourses.find((x) => x.id === id);
    if (c) applySavedCourse(c);
  }

  function handleSaveCourse() {
    setValidationError(null);

    const par = parseFiniteNumber(coursePar);
    const cr = parseFiniteNumber(courseRating);
    const br = parseFiniteNumber(bogeyRating);
    const slope = parseFiniteNumber(slopeRating);

    if (par === null || cr === null || br === null || slope === null) {
      setValidationError("Enter valid numbers for course par, ratings, slope, and bogey rating.");
      return;
    }

    if (!teeName.trim()) {
      setValidationError("Enter a tee name before saving.");
      return;
    }

    const parsed = buildHoleInputs(holeRows);
    if (parsed.some((p) => p.par === null || p.yards === null || p.hcp === null)) {
      setValidationError("Enter par, yards, and handicap rank for every hole before saving.");
      return;
    }

    const holesForRank = parsed.map((p) => ({
      hole: p.hole,
      par: p.par as number,
      yards: p.yards as number,
      handicapRank: p.hcp as number,
    }));

    if (
      holesForRank.some(
        (h) => !Number.isFinite(h.handicapRank) || !Number.isInteger(h.handicapRank),
      )
    ) {
      setValidationError("Each hole needs a whole-number handicap rank (1–18).");
      return;
    }

    const rankError = validateHandicapRanks(holesForRank);
    if (rankError) {
      setValidationError(rankError);
      return;
    }

    const created = addSavedCourse({
      teeName: teeName.trim(),
      coursePar: par,
      courseRating: cr,
      bogeyRating: br,
      slopeRating: slope,
      holes: holesForRank.map((h) => ({
        par: h.par,
        yards: h.yards,
        handicapRank: h.handicapRank,
      })),
    });

    refreshSavedCourses();
    setSelectedSavedId(created.id);
  }

  function handleApplyCoursePaste() {
    setPasteFeedback(null);
    const parsed = parseCoursePaste(coursePasteText);
    if (!parsed.ok) {
      setValidationError(parsed.error);
      return;
    }
    setValidationError(null);
    setTeeName(parsed.teeName);
    setCoursePar(String(parsed.coursePar));
    setCourseRating(String(parsed.courseRating));
    setSlopeRating(String(parsed.slopeRating));
    setBogeyRating(parsed.bogeyRating.toFixed(1));
    setHoleRows(
      parsed.holes.map((h) => ({
        par: String(h.par),
        yards: String(h.yards),
        hcp: String(h.handicapRank),
      })),
    );
    setPasteFeedback(
      parsed.warnings.length > 0 ? parsed.warnings.join(" ") : "Course data applied from paste.",
    );
  }

  function handleRemoveSaved(id: string) {
    removeSavedCourse(id);
    refreshSavedCourses();
    if (selectedSavedId === id) {
      setSelectedSavedId("");
    }
  }

  const resultsByHole = useMemo(() => {
    if (!results) return new Map<number, ExpectedScoreResult["holes"][0]>();
    return new Map(results.holes.map((h) => [h.hole, h]));
  }, [results]);

  function updateHole(i: number, patch: Partial<HoleRowState>) {
    setHoleRows((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], ...patch };
      return next;
    });
  }

  function parseGhinSummary(): PlayingHistorySummary | null | "partial" {
    const trimmed = [ghinScoreCount, ghinHigh, ghinLow, ghinAvg].map((s) => s.trim());
    const any = trimmed.some((s) => s.length > 0);
    const all = trimmed.every((s) => s.length > 0);
    if (!any) return null;
    if (!all) return "partial";
    const scoreCount = Number.parseInt(ghinScoreCount.trim(), 10);
    const high = parseFiniteNumber(ghinHigh.trim());
    const low = parseFiniteNumber(ghinLow.trim());
    const average = parseFiniteNumber(ghinAvg.trim());
    if (
      !Number.isFinite(scoreCount) ||
      high === null ||
      low === null ||
      average === null
    ) {
      return "partial";
    }
    return { scoreCount, high, low, average };
  }

  function handleCalculate() {
    setValidationError(null);
    setResults(null);
    setHistoryInsight(null);
    setPasteFeedback(null);

    const hi = parseFiniteNumber(handicapIndex);
    const par = parseFiniteNumber(coursePar);
    const cr = parseFiniteNumber(courseRating);
    const br = parseFiniteNumber(bogeyRating);
    const slope = parseFiniteNumber(slopeRating);

    if (
      hi === null ||
      par === null ||
      cr === null ||
      br === null ||
      slope === null
    ) {
      setValidationError("Enter valid numbers for handicap, course, and slope fields.");
      return;
    }

    if (!teeName.trim()) {
      setValidationError("Enter a tee name.");
      return;
    }

    const parsed = buildHoleInputs(holeRows);
    if (parsed.some((p) => p.par === null || p.yards === null || p.hcp === null)) {
      setValidationError("Enter par, yards, and handicap rank for every hole.");
      return;
    }

    const holesForRank = parsed.map((p) => ({
      hole: p.hole,
      par: p.par as number,
      yards: p.yards as number,
      handicapRank: p.hcp as number,
    }));

    if (
      holesForRank.some(
        (h) => !Number.isFinite(h.handicapRank) || !Number.isInteger(h.handicapRank),
      )
    ) {
      setValidationError("Each hole needs a whole-number handicap rank (1–18).");
      return;
    }

    const rankError = validateHandicapRanks(holesForRank);
    if (rankError) {
      setValidationError(rankError);
      return;
    }

    const ghin = parseGhinSummary();
    if (ghin === "partial") {
      setValidationError(
        "Fill all recent-round fields (count, high, low, average) or clear them to skip.",
      );
      return;
    }
    if (ghin !== null) {
      const ghinErr = validatePlayingHistory(ghin);
      if (ghinErr) {
        setValidationError(ghinErr);
        return;
      }
    }

    const outcome = calculateExpectedScores({
      handicapIndex: hi,
      tee: {
        teeName: teeName.trim(),
        coursePar: par,
        courseRating: cr,
        bogeyRating: br,
        slopeRating: slope,
      },
      holes: holesForRank,
    });

    setResults(outcome);
    if (ghin !== null) {
      setHistoryInsight(buildPlayingHistoryInsight(outcome.expectedRoundTotal, ghin));
    }
  }

  return (
    <div className="mvp" data-testid="mvp-root">
      <header className="mvp-header">
        <h1>Golf Expectations</h1>
        <p className="mvp-lede">
          Expected score per hole from your handicap index, tee ratings, and hole data. Expected
          round total blends <strong>course rating</strong> and <strong>bogey rating</strong> by
          handicap index (reference index {BOGEY_REFERENCE_HANDICAP_INDEX}). The adjustment that
          reconciles that total to par plus handicap strokes is split across holes by each
          hole’s share of total yardage.
        </p>
      </header>

      <section className="mvp-panel" aria-labelledby="saved-heading">
        <h2 id="saved-heading">Saved courses</h2>
        <p className="mvp-hint">
          Saves tee ratings (including bogey rating) and all 18 holes to this browser. Reload the
          page to confirm persistence.
        </p>
        <div className="mvp-saved-row">
          <label className="mvp-field mvp-field-grow">
            <span>Load a saved course</span>
            <select
              data-testid="saved-course-select"
              value={selectedSavedId}
              onChange={(e) => handleSavedSelect(e.target.value)}
            >
              <option value="">— Select —</option>
              {savedCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {formatSavedCourseLabel(c)}
                </option>
              ))}
            </select>
          </label>
          <button type="button" data-testid="save-course-button" onClick={handleSaveCourse}>
            Save current course
          </button>
        </div>
        {savedCourses.length > 0 ? (
          <ul className="mvp-saved-list" data-testid="saved-courses-list">
            {savedCourses.map((c) => (
              <li key={c.id}>
                <span>{formatSavedCourseLabel(c)}</span>
                <button
                  type="button"
                  className="mvp-saved-remove"
                  aria-label={`Remove saved course ${c.teeName}`}
                  data-testid={`saved-course-remove-${c.id}`}
                  onClick={() => handleRemoveSaved(c.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="mvp-panel" aria-labelledby="setup-heading">
        <h2 id="setup-heading">Golfer &amp; tee</h2>
        <div className="mvp-grid">
          <label className="mvp-field">
            <span>Handicap index</span>
            <input
              data-testid="handicap-index"
              inputMode="decimal"
              value={handicapIndex}
              onChange={(e) => setHandicapIndex(e.target.value)}
            />
          </label>
          <label className="mvp-field">
            <span>Tee name</span>
            <input
              data-testid="tee-name"
              value={teeName}
              onChange={(e) => setTeeName(e.target.value)}
            />
          </label>
          <label className="mvp-field">
            <span>Course par</span>
            <input
              data-testid="course-par"
              inputMode="numeric"
              value={coursePar}
              onChange={(e) => setCoursePar(e.target.value)}
            />
          </label>
          <label className="mvp-field">
            <span>Course rating</span>
            <input
              data-testid="course-rating"
              inputMode="decimal"
              value={courseRating}
              onChange={(e) => setCourseRating(e.target.value)}
            />
          </label>
          <label className="mvp-field">
            <span>Bogey rating</span>
            <input
              data-testid="bogey-rating"
              inputMode="decimal"
              value={bogeyRating}
              onChange={(e) => setBogeyRating(e.target.value)}
            />
          </label>
          <label className="mvp-field">
            <span>Slope</span>
            <input
              data-testid="slope-rating"
              inputMode="numeric"
              value={slopeRating}
              onChange={(e) => setSlopeRating(e.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="mvp-panel" aria-labelledby="ghin-heading">
        <h2 id="ghin-heading">Recent rounds (GHIN summary)</h2>
        <p className="mvp-hint">
          Optional. Copy your last{" "}
          <strong>{GHIN_FULL_WEIGHT_ROUNDS}</strong> scores summary (e.g. Scores: 20, High / Low /
          Avg.). Leave blank to use the model only.
        </p>
        <div className="mvp-grid">
          <label className="mvp-field">
            <span># of scores</span>
            <input
              data-testid="ghin-score-count"
              inputMode="numeric"
              value={ghinScoreCount}
              onChange={(e) => setGhinScoreCount(e.target.value)}
              placeholder="e.g. 20"
            />
          </label>
          <label className="mvp-field">
            <span>High</span>
            <input
              data-testid="ghin-high"
              inputMode="numeric"
              value={ghinHigh}
              onChange={(e) => setGhinHigh(e.target.value)}
              placeholder="102"
            />
          </label>
          <label className="mvp-field">
            <span>Low</span>
            <input
              data-testid="ghin-low"
              inputMode="numeric"
              value={ghinLow}
              onChange={(e) => setGhinLow(e.target.value)}
              placeholder="83"
            />
          </label>
          <label className="mvp-field">
            <span>Avg.</span>
            <input
              data-testid="ghin-avg"
              inputMode="decimal"
              value={ghinAvg}
              onChange={(e) => setGhinAvg(e.target.value)}
              placeholder="93.3"
            />
          </label>
        </div>
      </section>

      <section className="mvp-panel" aria-labelledby="holes-heading">
        <h2 id="holes-heading">Holes</h2>
        <p className="mvp-hint">
          Paste a tee sheet block (tab-separated): tee name + par, rating, slope, then rows{" "}
          <code className="mvp-inline-code">yds</code>, <code className="mvp-inline-code">Par</code>
          , <code className="mvp-inline-code">Hcp</code> with optional Out/In/Tot columns. Bogey
          rating is filled from course rating + slope if not in the paste.
        </p>
        <div className="mvp-paste-block">
          <label className="mvp-field" htmlFor="course-paste">
            <span>Paste course / tee data</span>
          </label>
          <textarea
            id="course-paste"
            className="mvp-paste-textarea"
            data-testid="course-paste-textarea"
            value={coursePasteText}
            onChange={(e) => setCoursePasteText(e.target.value)}
            rows={8}
            spellCheck={false}
            placeholder={`White\t72\n...\nyds\t372\t384\t...\nPar\t4\t4\t...\nHcp\t7\t1\t...`}
          />
          <div className="mvp-paste-actions">
            <button type="button" data-testid="apply-course-paste" onClick={handleApplyCoursePaste}>
              Apply paste to table
            </button>
          </div>
          {pasteFeedback ? (
            <p className="mvp-paste-feedback" role="status">
              {pasteFeedback}
            </p>
          ) : null}
        </div>
        <div className="mvp-table-wrap">
          <table className="mvp-hole-table">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Par</th>
                <th scope="col">Yards</th>
                <th scope="col">Hcp rank</th>
              </tr>
            </thead>
            <tbody>
              {holeRows.map((row, i) => {
                const n = i + 1;
                return (
                  <tr key={n}>
                    <th scope="row">{n}</th>
                    <td>
                      <input
                        data-testid={`hole-row-${n}-par`}
                        inputMode="numeric"
                        value={row.par}
                        onChange={(e) => updateHole(i, { par: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        data-testid={`hole-row-${n}-yards`}
                        inputMode="numeric"
                        value={row.yards}
                        onChange={(e) => updateHole(i, { yards: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        data-testid={`hole-row-${n}-hcp`}
                        inputMode="numeric"
                        value={row.hcp}
                        onChange={(e) => updateHole(i, { hcp: e.target.value })}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mvp-actions">
        <button type="button" data-testid="calculate-button" onClick={handleCalculate}>
          Calculate expected scores
        </button>
      </div>

      {validationError ? (
        <p className="mvp-error" role="alert" data-testid="validation-error">
          {validationError}
        </p>
      ) : null}

      {results ? (
        <section className="mvp-panel" aria-labelledby="results-heading">
          <h2 id="results-heading">Results</h2>
          <p className="mvp-meta">
            Course handicap (exact): {results.courseHandicapExact.toFixed(2)} · Expected round
            (bogey blend): {results.expectedRoundTotal.toFixed(2)}
          </p>
          {historyInsight ? (
            <div className="mvp-ghin-insight" data-testid="playing-history-insight">
              <h3 className="mvp-ghin-insight-title">Your recent scoring vs model</h3>
              <p>
                Last <strong>{historyInsight.summary.scoreCount}</strong> rounds:{" "}
                <strong>
                  {historyInsight.summary.low} – {historyInsight.summary.high}
                </strong>{" "}
                (avg <strong>{historyInsight.summary.average.toFixed(1)}</strong>)
              </p>
              <p>
                Modeled total minus your avg:{" "}
                <strong>
                  {historyInsight.modelMinusAverage >= 0 ? "+" : ""}
                  {historyInsight.modelMinusAverage.toFixed(1)}
                </strong>{" "}
                strokes.
              </p>
              <p>
                Blended planning total (model + recent avg, weight{" "}
                {(historyInsight.personalWeight * 100).toFixed(0)}% on your average at{" "}
                {GHIN_FULL_WEIGHT_ROUNDS}+ scores):{" "}
                <strong>{historyInsight.blendedRoundTotal.toFixed(1)}</strong>
              </p>
              <p className="mvp-hint mvp-ghin-band">
                Informal &ldquo;typical day&rdquo; band from your avg and spread (not a formal
                prediction interval):{" "}
                <strong>
                  {historyInsight.typicalBand.low.toFixed(1)} –{" "}
                  {historyInsight.typicalBand.high.toFixed(1)}
                </strong>
              </p>
            </div>
          ) : null}
          <div className="mvp-totals">
            <span data-testid="total-front">Front: {results.totalFront.toFixed(2)}</span>
            <span data-testid="total-back">Back: {results.totalBack.toFixed(2)}</span>
            <span data-testid="total-18">18: {results.total18.toFixed(2)}</span>
          </div>
          <div className="mvp-table-wrap">
            <table data-testid="results-table" className="mvp-results-table">
              <thead>
                <tr>
                  <th scope="col">Hole</th>
                  <th scope="col">Expected</th>
                  <th scope="col">Rounded</th>
                  <th scope="col">Range</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 18 }, (_, i) => i + 1).map((hole) => {
                  const row = resultsByHole.get(hole);
                  if (!row) return null;
                  return (
                    <tr key={hole}>
                      <th scope="row">{hole}</th>
                      <td data-testid={`result-hole-${hole}-expected-decimal`}>
                        {row.expectedDecimal.toFixed(2)}
                      </td>
                      <td data-testid={`result-hole-${hole}-expected-integer`}>
                        {row.expectedInteger}
                      </td>
                      <td data-testid={`result-hole-${hole}-expected-range`}>
                        {row.expectedRangeLabel}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
