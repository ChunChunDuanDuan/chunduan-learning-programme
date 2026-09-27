export default function GrammarReference() { return <div><section className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">English Tense Reference</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            A compact table for reviewing the basic tense-aspect system.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-100">
                  <th className="p-3 font-semibold">Form</th>
                  <th className="p-3 font-semibold">Example</th>
                  <th className="p-3 font-semibold">Main Use</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-b border-neutral-200">
                  <td className="p-3 font-medium">Present Simple</td>
                  <td className="p-3">I study every day.</td>
                  <td className="p-3">Habits, facts, regular actions.</td>
                </tr>

                <tr className="border-b border-neutral-200">
                  <td className="p-3 font-medium">Present Continuous</td>
                  <td className="p-3">I am studying now.</td>
                  <td className="p-3">Actions happening now or around now.</td>
                </tr>

                <tr className="border-b border-neutral-200">
                  <td className="p-3 font-medium">Present Perfect</td>
                  <td className="p-3">I have studied this before.</td>
                  <td className="p-3">Past action with present relevance.</td>
                </tr>

                <tr className="border-b border-neutral-200">
                  <td className="p-3 font-medium">Past Simple</td>
                  <td className="p-3">I studied yesterday.</td>
                  <td className="p-3">Completed past actions.</td>
                </tr>

                <tr className="border-b border-neutral-200">
                  <td className="p-3 font-medium">Past Continuous</td>
                  <td className="p-3">I was studying at eight.</td>
                  <td className="p-3">Ongoing past actions.</td>
                </tr>

                <tr className="border-b border-neutral-200">
                  <td className="p-3 font-medium">Future with will</td>
                  <td className="p-3">I will study tomorrow.</td>
                  <td className="p-3">Predictions, promises, spontaneous decisions.</td>
                </tr>

                <tr>
                  <td className="p-3 font-medium">Going to</td>
                  <td className="p-3">I am going to study tonight.</td>
                  <td className="p-3">Plans, intentions, visible future results.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Clause Patterns</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Basic sentence structures useful for reading and writing analysis.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-100">
                  <th className="p-3 font-semibold">Pattern</th>
                  <th className="p-3 font-semibold">Example</th>
                  <th className="p-3 font-semibold">Structure</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-b border-neutral-200">
                  <td className="p-3 font-medium">S + V</td>
                  <td className="p-3">She sleeps.</td>
                  <td className="p-3">Subject + verb.</td>
                </tr>

                <tr className="border-b border-neutral-200">
                  <td className="p-3 font-medium">S + V + O</td>
                  <td className="p-3">She reads a book.</td>
                  <td className="p-3">Subject + verb + object.</td>
                </tr>

                <tr className="border-b border-neutral-200">
                  <td className="p-3 font-medium">S + V + C</td>
                  <td className="p-3">She is tired.</td>
                  <td className="p-3">Subject + linking verb + complement.</td>
                </tr>

                <tr>
                  <td className="p-3 font-medium">S + V + O + C</td>
                  <td className="p-3">They made him angry.</td>
                  <td className="p-3">Object followed by object complement.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>; }